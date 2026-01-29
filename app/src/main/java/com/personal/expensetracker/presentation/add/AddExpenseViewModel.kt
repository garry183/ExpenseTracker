package com.personal.expensetracker.presentation.add

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.personal.expensetracker.domain.model.Category
import com.personal.expensetracker.domain.model.Expense
import com.personal.expensetracker.domain.repository.CategoryRepository
import com.personal.expensetracker.domain.usecase.AddExpenseUseCase
import com.personal.expensetracker.domain.usecase.VoiceParserUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import javax.inject.Inject

@HiltViewModel
class AddExpenseViewModel @Inject constructor(
    private val addExpenseUseCase: AddExpenseUseCase,
    private val voiceParserUseCase: VoiceParserUseCase,
    categoryRepository: CategoryRepository
) : ViewModel() {
    
    val categories: StateFlow<List<Category>> = categoryRepository.getAllCategories()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    
    private val _uiState = MutableStateFlow(AddExpenseUiState())
    val uiState: StateFlow<AddExpenseUiState> = _uiState.asStateFlow()
    
    private val _navigationEvent = MutableSharedFlow<AddExpenseEvent>()
    val navigationEvent: SharedFlow<AddExpenseEvent> = _navigationEvent.asSharedFlow()
    
    fun onAmountChange(amount: String) {
        _uiState.update { it.copy(amount = amount, error = null) }
    }
    
    fun onCategorySelect(category: Category) {
        _uiState.update { it.copy(selectedCategory = category, error = null) }
    }
    
    fun onDateSelect(date: LocalDateTime) {
        _uiState.update { it.copy(selectedDate = date, error = null) }
    }
    
    fun onTodayClick() {
        _uiState.update { it.copy(selectedDate = LocalDateTime.now()) }
    }
    
    fun onYesterdayClick() {
        _uiState.update { it.copy(selectedDate = LocalDateTime.now().minusDays(1)) }
    }
    
    fun onNoteChange(note: String) {
        _uiState.update { it.copy(note = note) }
    }
    
    fun onVoiceResult(voiceInput: String) {
        val parsed = voiceParserUseCase(voiceInput, categories.value)
        
        parsed.amount?.let { amount ->
            _uiState.update { it.copy(amount = amount.toString()) }
        }
        
        parsed.date?.let { date ->
            _uiState.update { it.copy(selectedDate = date) }
        }
        
        parsed.categoryName?.let { categoryName ->
            val category = categories.value.find { 
                it.name.equals(categoryName, ignoreCase = true) 
            }
            category?.let { cat ->
                _uiState.update { it.copy(selectedCategory = cat) }
            }
        }
    }
    
    fun onSaveClick() {
        viewModelScope.launch {
            val state = _uiState.value
            
            // Validation
            val amountValue = state.amount.toDoubleOrNull()
            if (amountValue == null || amountValue <= 0) {
                _uiState.update { it.copy(error = "Please enter a valid amount") }
                return@launch
            }
            
            if (state.selectedCategory == null) {
                _uiState.update { it.copy(error = "Please select a category") }
                return@launch
            }
            
            val expense = Expense(
                amount = amountValue,
                categoryId = state.selectedCategory.id,
                date = state.selectedDate,
                note = state.note
            )
            
            _uiState.update { it.copy(isSaving = true) }
            
            val result = addExpenseUseCase(expense)
            
            _uiState.update { it.copy(isSaving = false) }
            
            if (result.isSuccess) {
                _navigationEvent.emit(AddExpenseEvent.Success)
            } else {
                _uiState.update { it.copy(error = "Failed to save expense") }
            }
        }
    }
}

data class AddExpenseUiState(
    val amount: String = "",
    val selectedCategory: Category? = null,
    val selectedDate: LocalDateTime = LocalDateTime.now(),
    val note: String = "",
    val error: String? = null,
    val isSaving: Boolean = false
)

sealed class AddExpenseEvent {
    object Success : AddExpenseEvent()
}
