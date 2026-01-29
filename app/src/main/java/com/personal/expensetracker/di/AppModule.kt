package com.personal.expensetracker.di

import com.google.firebase.firestore.FirebaseFirestore
import com.personal.expensetracker.data.remote.FirebaseDataSource
import com.personal.expensetracker.data.remote.SyncManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    fun provideFirebaseFirestore(): FirebaseFirestore {
        return FirebaseFirestore.getInstance()
    }
    
    @Provides
    @Singleton
    fun provideFirebaseDataSource(firestore: FirebaseFirestore): FirebaseDataSource {
        return FirebaseDataSource(firestore)
    }
}
