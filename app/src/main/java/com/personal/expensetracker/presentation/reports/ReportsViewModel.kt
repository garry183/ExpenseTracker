package com.personal.expensetracker.presentation.reports

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.personal.expensetracker.domain.model.Category
import com.personal.expensetracker.domain.repository.CategoryRepository
import com.personal.expensetracker.domain.usecase.GetReportsUseCase
import com.personal.expensetracker.domain.usecase.MonthlyReport
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import javax.inject.Inject

@HiltViewModel
class ReportsViewModel @Inject constructor(
    private val getReportsUseCase: GetReportsUseCase,
    private val categoryRepository: CategoryRepository
) : ViewModel() {
    
    private val _selectedMonth = MutableStateFlow(LocalDateTime.now())
    val selectedMonth: StateFlow<LocalDateTime> = _selectedMonth.asStateFlow()
    
    val categories: StateFlow<List<Category>> = categoryRepository.getAllCategories()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    
    val dailyReport = _selectedMonth.flatMapLatest { date ->
        getReportsUseCase.getDailyReport(date)
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        null
    )
    
    val monthlyReport: StateFlow<MonthlyReport?> = _selectedMonth.flatMapLatest { date ->
        getReportsUseCase.getMonthlyReport(date.monthValue, date.year)
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        null
    )
    
    fun onPreviousMonth() {
        _selectedMonth.update { it.minusMonths(1) }
    }
    
    fun onNextMonth() {
        _selectedMonth.update { it.plusMonths(1) }
    }
    
    fun getCategoryById(id: Long): Category? {
        return categories.value.find { it.id == id }
    }
}
