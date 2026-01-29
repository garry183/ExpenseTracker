package com.personal.expensetracker.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.personal.expensetracker.domain.model.Expense
import com.personal.expensetracker.domain.model.SyncStatus
import java.time.LocalDateTime

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val amount: Double,
    val categoryId: Long,
    val date: String, // Store as ISO string
    val note: String,
    val syncStatus: String,
    val createdAt: String,
    val updatedAt: String
) {
    fun toDomain(): Expense = Expense(
        id = id,
        amount = amount,
        categoryId = categoryId,
        date = LocalDateTime.parse(date),
        note = note,
        syncStatus = SyncStatus.valueOf(syncStatus),
        createdAt = LocalDateTime.parse(createdAt),
        updatedAt = LocalDateTime.parse(updatedAt)
    )
    
    companion object {
        fun fromDomain(expense: Expense): ExpenseEntity = ExpenseEntity(
            id = expense.id,
            amount = expense.amount,
            categoryId = expense.categoryId,
            date = expense.date.toString(),
            note = expense.note,
            syncStatus = expense.syncStatus.name,
            createdAt = expense.createdAt.toString(),
            updatedAt = expense.updatedAt.toString()
        )
    }
}
