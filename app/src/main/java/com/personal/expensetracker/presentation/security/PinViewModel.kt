package com.personal.expensetracker.presentation.security

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

@HiltViewModel
class PinViewModel @Inject constructor(
    @ApplicationContext private val context: Context
) : ViewModel() {
    
    private val PIN_KEY = stringPreferencesKey("user_pin")
    
    private val _pinState = MutableStateFlow(PinState())
    val pinState: StateFlow<PinState> = _pinState.asStateFlow()
    
    private val _navigationEvent = MutableSharedFlow<NavigationEvent>()
    val navigationEvent: SharedFlow<NavigationEvent> = _navigationEvent.asSharedFlow()
    
    init {
        checkPinExists()
    }
    
    private fun checkPinExists() {
        viewModelScope.launch {
            context.dataStore.data
                .map { preferences -> preferences[PIN_KEY] }
                .firstOrNull()?.let { savedPin ->
                    _pinState.update { it.copy(isSetupMode = false, savedPin = savedPin) }
                } ?: run {
                    _pinState.update { it.copy(isSetupMode = true) }
                }
        }
    }
    
    fun onNumberClick(number: Int) {
        val currentPin = _pinState.value.enteredPin
        if (currentPin.length < 4) {
            val newPin = currentPin + number.toString()
            _pinState.update { it.copy(enteredPin = newPin, error = null) }
            
            if (newPin.length == 4) {
                validatePin(newPin)
            }
        }
    }
    
    fun onBackspaceClick() {
        val currentPin = _pinState.value.enteredPin
        if (currentPin.isNotEmpty()) {
            _pinState.update { it.copy(enteredPin = currentPin.dropLast(1), error = null) }
        }
    }
    
    private fun validatePin(pin: String) {
        viewModelScope.launch {
            if (_pinState.value.isSetupMode) {
                if (_pinState.value.confirmPin == null) {
                    // First entry, ask for confirmation
                    _pinState.update { it.copy(confirmPin = pin, enteredPin = "") }
                } else {
                    // Confirmation entry
                    if (pin == _pinState.value.confirmPin) {
                        savePin(pin)
                    } else {
                        _pinState.update { 
                            it.copy(
                                error = "PINs do not match",
                                enteredPin = "",
                                confirmPin = null
                            ) 
                        }
                    }
                }
            } else {
                // Verification mode
                if (pin == _pinState.value.savedPin) {
                    _navigationEvent.emit(NavigationEvent.Success)
                } else {
                    _pinState.update { it.copy(error = "Incorrect PIN", enteredPin = "") }
                }
            }
        }
    }
    
    private fun savePin(pin: String) {
        viewModelScope.launch {
            context.dataStore.edit { preferences ->
                preferences[PIN_KEY] = pin
            }
            _navigationEvent.emit(NavigationEvent.Success)
        }
    }
}

data class PinState(
    val isSetupMode: Boolean = true,
    val enteredPin: String = "",
    val confirmPin: String? = null,
    val savedPin: String? = null,
    val error: String? = null
)

sealed class NavigationEvent {
    object Success : NavigationEvent()
}
