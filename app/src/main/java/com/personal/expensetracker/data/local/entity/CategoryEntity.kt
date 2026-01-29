package com.personal.expensetracker.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.personal.expensetracker.domain.model.Category

@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val icon: String,
    val color: String
) {
    fun toDomain(): Category = Category(
        id = id,
        name = name,
        icon = icon,
        color = color
    )
    
    companion object {
        fun fromDomain(category: Category): CategoryEntity = CategoryEntity(
            id = category.id,
            name = category.name,
            icon = category.icon,
            color = category.color
        )
    }
}
