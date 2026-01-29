package com.personal.expensetracker.domain.model

data class Budget(
    val id: Long = 0,
    val categoryId: Long,
    val amount: Double,
    val month: Int,
    val year: Int
)
