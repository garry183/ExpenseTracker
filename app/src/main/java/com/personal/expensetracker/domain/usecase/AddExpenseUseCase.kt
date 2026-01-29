package com.personal.expensetracker.domain.usecase

import com.personal.expensetracker.domain.model.Expense
import com.personal.expensetracker.domain.repository.ExpenseRepository
import javax.inject.Inject

class AddExpenseUseCase @Inject constructor(
    private val expenseRepository: ExpenseRepository
) {
    suspend operator fun invoke(expense: Expense): Result<Long> {
        return try {
            val id = expenseRepository.insertExpense(expense)
            Result.success(id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
