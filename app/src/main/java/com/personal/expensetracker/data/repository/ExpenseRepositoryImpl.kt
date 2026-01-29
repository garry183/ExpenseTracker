package com.personal.expensetracker.data.repository

import com.personal.expensetracker.data.local.dao.ExpenseDao
import com.personal.expensetracker.data.local.entity.ExpenseEntity
import com.personal.expensetracker.data.remote.FirebaseDataSource
import com.personal.expensetracker.data.remote.SyncManager
import com.personal.expensetracker.domain.model.Expense
import com.personal.expensetracker.domain.model.SyncStatus
import com.personal.expensetracker.domain.repository.ExpenseRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.LocalDateTime
import javax.inject.Inject

class ExpenseRepositoryImpl @Inject constructor(
    private val expenseDao: ExpenseDao,
    private val firebaseDataSource: FirebaseDataSource,
    private val syncManager: SyncManager
) : ExpenseRepository {
    
    override fun getAllExpenses(): Flow<List<Expense>> {
        return expenseDao.getAllExpenses().map { entities ->
            entities.map { it.toDomain() }
        }
    }
    
    override fun getExpenseById(id: Long): Flow<Expense?> {
        return expenseDao.getExpenseById(id).map { it?.toDomain() }
    }
    
    override fun getExpensesByDateRange(
        startDate: LocalDateTime,
        endDate: LocalDateTime
    ): Flow<List<Expense>> {
        return expenseDao.getExpensesByDateRange(
            startDate.toString(),
            endDate.toString()
        ).map { entities ->
            entities.map { it.toDomain() }
        }
    }
    
    override fun getExpensesByCategory(categoryId: Long): Flow<List<Expense>> {
        return expenseDao.getExpensesByCategory(categoryId).map { entities ->
            entities.map { it.toDomain() }
        }
    }
    
    override suspend fun insertExpense(expense: Expense): Long {
        val entity = ExpenseEntity.fromDomain(expense)
        val id = expenseDao.insertExpense(entity)
        
        // Try to sync if online
        if (syncManager.isNetworkAvailable()) {
            trySync(expense.copy(id = id))
        }
        
        return id
    }
    
    override suspend fun updateExpense(expense: Expense) {
        val entity = ExpenseEntity.fromDomain(expense)
        expenseDao.updateExpense(entity)
        
        // Try to sync if online
        if (syncManager.isNetworkAvailable()) {
            trySync(expense)
        }
    }
    
    override suspend fun deleteExpense(expense: Expense) {
        val entity = ExpenseEntity.fromDomain(expense)
        expenseDao.deleteExpense(entity)
    }
    
    override suspend fun syncPendingExpenses() {
        if (!syncManager.isNetworkAvailable()) return
        
        val pendingExpenses = expenseDao.getPendingExpenses()
        pendingExpenses.forEach { entity ->
            trySync(entity.toDomain())
        }
    }
    
    private suspend fun trySync(expense: Expense) {
        val result = firebaseDataSource.syncExpense(expense, "default_user")
        if (result.isSuccess) {
            expenseDao.updateSyncStatus(expense.id, SyncStatus.SYNCED.name)
        } else {
            expenseDao.updateSyncStatus(expense.id, SyncStatus.FAILED.name)
        }
    }
}
