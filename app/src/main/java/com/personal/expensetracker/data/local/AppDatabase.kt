package com.personal.expensetracker.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.personal.expensetracker.data.local.dao.BudgetDao
import com.personal.expensetracker.data.local.dao.CategoryDao
import com.personal.expensetracker.data.local.dao.ExpenseDao
import com.personal.expensetracker.data.local.entity.BudgetEntity
import com.personal.expensetracker.data.local.entity.CategoryEntity
import com.personal.expensetracker.data.local.entity.ExpenseEntity

@Database(
    entities = [
        ExpenseEntity::class,
        CategoryEntity::class,
        BudgetEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun expenseDao(): ExpenseDao
    abstract fun categoryDao(): CategoryDao
    abstract fun budgetDao(): BudgetDao
}
