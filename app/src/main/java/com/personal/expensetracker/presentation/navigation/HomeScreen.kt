package com.personal.expensetracker.presentation.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.personal.expensetracker.domain.model.Expense
import com.personal.expensetracker.domain.repository.CategoryRepository
import com.personal.expensetracker.domain.repository.ExpenseRepository
import kotlinx.coroutines.flow.Flow
import java.text.NumberFormat
import java.time.format.DateTimeFormatter
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToAddExpense: () -> Unit,
    onNavigateToReports: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val expenses by viewModel.expenses.collectAsState()
    val categories by viewModel.categories.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Expense Tracker") },
                actions = {
                    IconButton(onClick = onNavigateToReports) {
                        Icon(Icons.Default.Assessment, "Reports")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToAddExpense
            ) {
                Icon(Icons.Default.Add, "Add expense")
            }
        }
    ) { paddingValues ->
        if (expenses.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "No expenses yet",
                        style = MaterialTheme.typography.titleLarge
                    )
                    Text(
                        text = "Tap + to add your first expense",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(expenses) { expense ->
                    val category = categories.find { it.id == expense.categoryId }
                    ExpenseItem(expense = expense, categoryName = category?.name ?: "Unknown")
                }
            }
        }
    }
}

@Composable
fun ExpenseItem(
    expense: Expense,
    categoryName: String
) {
    val currencyFormat = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
    val dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")
    
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = categoryName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = expense.date.format(dateFormatter),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (expense.note.isNotEmpty()) {
                    Text(
                        text = expense.note,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
            
            Text(
                text = currencyFormat.format(expense.amount),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

// HomeViewModel
@dagger.hilt.android.lifecycle.HiltViewModel
class HomeViewModel @javax.inject.Inject constructor(
    expenseRepository: ExpenseRepository,
    categoryRepository: CategoryRepository
) : androidx.lifecycle.ViewModel() {
    
    val expenses: kotlinx.coroutines.flow.StateFlow<List<Expense>> = expenseRepository.getAllExpenses()
        .stateIn(
            androidx.lifecycle.viewModelScope,
            kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    
    val categories = categoryRepository.getAllCategories()
        .stateIn(
            androidx.lifecycle.viewModelScope,
            kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
}
