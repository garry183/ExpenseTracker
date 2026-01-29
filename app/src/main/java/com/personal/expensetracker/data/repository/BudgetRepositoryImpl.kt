package com.personal.expensetracker.data.repository

import com.personal.expensetracker.data.local.dao.BudgetDao
import com.personal.expensetracker.data.local.entity.BudgetEntity
import com.personal.expensetracker.domain.model.Budget
import com.personal.expensetracker.domain.repository.BudgetRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class BudgetRepositoryImpl @Inject constructor(
    private val budgetDao: BudgetDao
) : BudgetRepository {
    
    override fun getAllBudgets(): Flow<List<Budget>> {
        return budgetDao.getAllBudgets().map { entities ->
            entities.map { it.toDomain() }
        }
    }
    
    override fun getBudgetById(id: Long): Flow<Budget?> {
        return budgetDao.getBudgetById(id).map { it?.toDomain() }
    }
    
    override fun getBudgetForCategoryAndMonth(
        categoryId: Long,
        month: Int,
        year: Int
    ): Flow<Budget?> {
        return budgetDao.getBudgetForCategoryAndMonth(categoryId, month, year)
            .map { it?.toDomain() }
    }
    
    override suspend fun insertBudget(budget: Budget): Long {
        val entity = BudgetEntity.fromDomain(budget)
        return budgetDao.insertBudget(entity)
    }
    
    override suspend fun updateBudget(budget: Budget) {
        val entity = BudgetEntity.fromDomain(budget)
        budgetDao.updateBudget(entity)
    }
    
    override suspend fun deleteBudget(budget: Budget) {
        val entity = BudgetEntity.fromDomain(budget)
        budgetDao.deleteBudget(entity)
    }
}
