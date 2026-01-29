package com.personal.expensetracker.di

import com.personal.expensetracker.data.repository.BudgetRepositoryImpl
import com.personal.expensetracker.data.repository.CategoryRepositoryImpl
import com.personal.expensetracker.data.repository.ExpenseRepositoryImpl
import com.personal.expensetracker.domain.repository.BudgetRepository
import com.personal.expensetracker.domain.repository.CategoryRepository
import com.personal.expensetracker.domain.repository.ExpenseRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    
    @Binds
    @Singleton
    abstract fun bindExpenseRepository(
        expenseRepositoryImpl: ExpenseRepositoryImpl
    ): ExpenseRepository
    
    @Binds
    @Singleton
    abstract fun bindCategoryRepository(
        categoryRepositoryImpl: CategoryRepositoryImpl
    ): CategoryRepository
    
    @Binds
    @Singleton
    abstract fun bindBudgetRepository(
        budgetRepositoryImpl: BudgetRepositoryImpl
    ): BudgetRepository
}
