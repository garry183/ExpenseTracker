package com.personal.expensetracker.domain.usecase

import com.personal.expensetracker.domain.model.Category
import java.time.LocalDateTime
import javax.inject.Inject

data class ParsedExpense(
    val amount: Double?,
    val categoryName: String?,
    val date: LocalDateTime?
)

class VoiceParserUseCase @Inject constructor() {
    
    operator fun invoke(voiceInput: String, categories: List<Category>): ParsedExpense {
        val input = voiceInput.lowercase()
        
        // Parse amount
        val amount = extractAmount(input)
        
        // Parse date
        val date = extractDate(input)
        
        // Parse category
        val categoryName = extractCategory(input, categories)
        
        return ParsedExpense(amount, categoryName, date)
    }
    
    private fun extractAmount(input: String): Double? {
        // Patterns: "250", "rs 250", "rupees 250", "spent 250"
        val patterns = listOf(
            Regex("""(?:spent|rs|rupees|inr)?\s*(\d+(?:\.\d+)?)"""),
            Regex("""(\d+(?:\.\d+)?)\s*(?:rupees|rs|inr)?""")
        )
        
        for (pattern in patterns) {
            val match = pattern.find(input)
            if (match != null) {
                return match.groupValues[1].toDoubleOrNull()
            }
        }
        return null
    }
    
    private fun extractDate(input: String): LocalDateTime? {
        return when {
            input.contains("yesterday") -> LocalDateTime.now().minusDays(1)
            input.contains("today") || !input.contains("yesterday") -> LocalDateTime.now()
            else -> LocalDateTime.now()
        }
    }
    
    private fun extractCategory(input: String, categories: List<Category>): String? {
        // Try to match category names or common keywords
        val categoryKeywords = mapOf(
            "food" to listOf("food", "restaurant", "lunch", "dinner", "breakfast", "meal"),
            "groceries" to listOf("groceries", "grocery", "supermarket", "vegetables", "fruits"),
            "transport" to listOf("transport", "cab", "taxi", "uber", "ola", "petrol", "fuel", "bus", "metro"),
            "entertainment" to listOf("entertainment", "movie", "cinema", "concert", "game"),
            "shopping" to listOf("shopping", "clothes", "shoes", "amazon", "flipkart"),
            "bills" to listOf("bills", "electricity", "water", "internet", "mobile", "phone"),
            "health" to listOf("health", "medicine", "doctor", "hospital", "pharmacy"),
            "others" to listOf("others", "other", "miscellaneous")
        )
        
        // First try exact category name match
        for (category in categories) {
            if (input.contains(category.name.lowercase())) {
                return category.name
            }
        }
        
        // Then try keyword match
        for ((categoryName, keywords) in categoryKeywords) {
            for (keyword in keywords) {
                if (input.contains(keyword)) {
                    return categoryName
                }
            }
        }
        
        return null
    }
}
