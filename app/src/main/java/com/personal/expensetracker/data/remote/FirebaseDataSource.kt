package com.personal.expensetracker.data.remote

import com.google.firebase.firestore.FirebaseFirestore
import com.personal.expensetracker.domain.model.Expense
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FirebaseDataSource @Inject constructor(
    private val firestore: FirebaseFirestore
) {
    
    private val expensesCollection = firestore.collection("expenses")
    
    suspend fun syncExpense(expense: Expense, userId: String): Result<Unit> {
        return try {
            val expenseData = mapOf(
                "amount" to expense.amount,
                "categoryId" to expense.categoryId,
                "date" to expense.date.toString(),
                "note" to expense.note,
                "userId" to userId,
                "createdAt" to expense.createdAt.toString(),
                "updatedAt" to expense.updatedAt.toString()
            )
            
            expensesCollection
                .document(expense.id.toString())
                .set(expenseData)
                .await()
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun fetchExpenses(userId: String): Result<List<Map<String, Any>>> {
        return try {
            val snapshot = expensesCollection
                .whereEqualTo("userId", userId)
                .get()
                .await()
            
            val expenses = snapshot.documents.mapNotNull { it.data }
            Result.success(expenses)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
