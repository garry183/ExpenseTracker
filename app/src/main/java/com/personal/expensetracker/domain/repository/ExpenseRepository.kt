package com.personal.expensetracker.domain.repository

import com.personal.expensetracker.domain.model.Expense
import kotlinx.coroutines.flow.Flow
import java.time.LocalDateTime

interface ExpenseRepository {
    fun getAllExpenses(): Flow<List<Expense>>
    fun getExpenseById(id: Long): Flow<Expense?>
    fun getExpensesByDateRange(startDate: LocalDateTime, endDate: LocalDateTime): Flow<List<Expense>>
    fun getExpensesByCategory(categoryId: Long): Flow<List<Expense>>
    suspend fun insertExpense(expense: Expense): Long
    suspend fun updateExpense(expense: Expense)
    suspend fun deleteExpense(expense: Expense)
    suspend fun syncPendingExpenses()
}
