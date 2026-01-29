package com.personal.expensetracker

import android.app.Application
import com.personal.expensetracker.domain.repository.CategoryRepository
import dagger.hilt.android.HiltAndroidApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltAndroidApp
class ExpenseTrackerApp : Application() {
    
    @Inject
    lateinit var categoryRepository: CategoryRepository
    
    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize default categories on first launch
        applicationScope.launch {
            categoryRepository.initializeDefaultCategories()
        }
    }
}
