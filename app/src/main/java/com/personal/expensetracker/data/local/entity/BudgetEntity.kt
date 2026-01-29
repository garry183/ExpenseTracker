package com.personal.expensetracker.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.personal.expensetracker.domain.model.Budget

@Entity(tableName = "budgets")
data class BudgetEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val categoryId: Long,
    val amount: Double,
    val month: Int,
    val year: Int
) {
    fun toDomain(): Budget = Budget(
        id = id,
        categoryId = categoryId,
        amount = amount,
        month = month,
        year = year
    )
    
    companion object {
        fun fromDomain(budget: Budget): BudgetEntity = BudgetEntity(
            id = budget.id,
            categoryId = budget.categoryId,
            amount = budget.amount,
            month = budget.month,
            year = budget.year
        )
    }
}
