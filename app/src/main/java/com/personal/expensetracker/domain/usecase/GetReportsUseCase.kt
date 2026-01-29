package com.personal.expensetracker.domain.usecase

import com.personal.expensetracker.domain.model.Expense
import com.personal.expensetracker.domain.repository.ExpenseRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.LocalDateTime
import javax.inject.Inject

data class DailyReport(
    val date: LocalDateTime,
    val totalAmount: Double,
    val expenseCount: Int
)

data class MonthlyReport(
    val month: Int,
    val year: Int,
    val totalAmount: Double,
    val categoryBreakdown: Map<Long, CategoryExpense>
)

data class CategoryExpense(
    val categoryId: Long,
    val amount: Double,
    val percentage: Double,
    val count: Int
)

class GetReportsUseCase @Inject constructor(
    private val expenseRepository: ExpenseRepository
) {
    
    fun getDailyReport(date: LocalDateTime): Flow<DailyReport> {
        val startOfDay = date.toLocalDate().atStartOfDay()
        val endOfDay = startOfDay.plusDays(1).minusSeconds(1)
        
        return expenseRepository.getExpensesByDateRange(startOfDay, endOfDay)
            .map { expenses ->
                DailyReport(
                    date = date,
                    totalAmount = expenses.sumOf { it.amount },
                    expenseCount = expenses.size
                )
            }
    }
    
    fun getMonthlyReport(month: Int, year: Int): Flow<MonthlyReport> {
        val startOfMonth = LocalDateTime.of(year, month, 1, 0, 0)
        val endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1)
        
        return expenseRepository.getExpensesByDateRange(startOfMonth, endOfMonth)
            .map { expenses ->
                val totalAmount = expenses.sumOf { it.amount }
                val categoryBreakdown = expenses
                    .groupBy { it.categoryId }
                    .mapValues { (_, categoryExpenses) ->
                        val categoryAmount = categoryExpenses.sumOf { it.amount }
                        CategoryExpense(
                            categoryId = categoryExpenses.first().categoryId,
                            amount = categoryAmount,
                            percentage = if (totalAmount > 0) (categoryAmount / totalAmount) * 100 else 0.0,
                            count = categoryExpenses.size
                        )
                    }
                
                MonthlyReport(
                    month = month,
                    year = year,
                    totalAmount = totalAmount,
                    categoryBreakdown = categoryBreakdown
                )
            }
    }
}
