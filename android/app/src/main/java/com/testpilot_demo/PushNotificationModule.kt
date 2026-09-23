package com.testpilot_demo

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.concurrent.atomic.AtomicInteger

class PushNotificationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val CHANNEL_ID = "todo_alerts_channel"
    private val notificationIdCounter = AtomicInteger(100)

    init {
        createNotificationChannel()
    }

    override fun getName(): String = "PushNotificationModule"

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "TestPilot Todo Alerts"
            val descriptionText = "Notifications for task creations and updates"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                enableVibration(true)
            }
            val notificationManager: NotificationManager =
                reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    @ReactMethod
    fun triggerNotification(title: String, message: String) {
        try {
            val notification = NotificationCompat.Builder(reactApplicationContext, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .build()

            val manager = NotificationManagerCompat.from(reactApplicationContext)
            manager.notify(notificationIdCounter.incrementAndGet(), notification)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
