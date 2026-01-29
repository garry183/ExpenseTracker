package com.personal.expensetracker.data.repository

import com.personal.expensetracker.data.local.dao.CategoryDao
import com.personal.expensetracker.data.local.entity.CategoryEntity
import com.personal.expensetracker.domain.model.Category
import com.personal.expensetracker.domain.repository.CategoryRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class CategoryRepositoryImpl @Inject constructor(
    private val categoryDao: CategoryDao
) : CategoryRepository {
    
    override fun getAllCategories(): Flow<List<Category>> {
        return categoryDao.getAllCategories().map { entities ->
            entities.map { it.toDomain() }
        }
    }
    
    override fun getCategoryById(id: Long): Flow<Category?> {
        return categoryDao.getCategoryById(id).map { it?.toDomain() }
    }
    
    override suspend fun insertCategory(category: Category): Long {
        val entity = CategoryEntity.fromDomain(category)
        return categoryDao.insertCategory(entity)
    }
    
    override suspend fun updateCategory(category: Category) {
        val entity = CategoryEntity.fromDomain(category)
        categoryDao.updateCategory(entity)
    }
    
    override suspend fun deleteCategory(category: Category) {
        val entity = CategoryEntity.fromDomain(category)
        categoryDao.deleteCategory(entity)
    }
    
    override suspend fun initializeDefaultCategories() {
        // Check if categories already exist
        if (categoryDao.getCategoryCount() > 0) return
        
        val defaultCategories = listOf(
            CategoryEntity(name = "Food", icon = "🍔", color = "#FF6B6B"),
            CategoryEntity(name = "Groceries", icon = "🛒", color = "#4ECDC4"),
            CategoryEntity(name = "Transport", icon = "🚗", color = "#45B7D1"),
            CategoryEntity(name = "Entertainment", icon = "🎬", color = "#96CEB4"),
            CategoryEntity(name = "Shopping", icon = "🛍️", color = "#FFEAA7"),
            CategoryEntity(name = "Bills", icon = "💡", color = "#DFE6E9"),
            CategoryEntity(name = "Health", icon = "🏥", color = "#74B9FF"),
            CategoryEntity(name = "Others", icon = "💰", color = "#A29BFE")
        )
        
        categoryDao.insertCategories(defaultCategories)
    }
}
