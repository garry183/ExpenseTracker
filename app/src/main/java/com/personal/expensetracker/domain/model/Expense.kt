package com.personal.expensetracker.domain.model

import java.time.LocalDateTime

data class Expense(
    val id: Long = 0,
    val amount: Double,
    val categoryId: Long,
    val date: LocalDateTime,
    val note: String = "",
    val syncStatus: SyncStatus = SyncStatus.PENDING,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class SyncStatus {
    PENDING,
    SYNCED,
    FAILED
}
