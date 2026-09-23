import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  NativeModules,
  Platform,
  PermissionsAndroid,
  Keyboard,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { PushNotificationModule } = NativeModules;

const PUBLIC_API_URL = 'https://jsonplaceholder.typicode.com/todos';
const EVENT_WEBHOOK_URL = 'https://jsonplaceholder.typicode.com/posts';

interface Todo {
  id: string | number;
  text: string;
  completed: boolean;
}

// Instant initial tasks for 0ms load time
const INITIAL_TODOS: Todo[] = [
  { id: '1', text: 'Automate React Native with Maestro', completed: false },
  { id: '2', text: 'Verify Firebase Test Lab Integration', completed: true },
  { id: '3', text: 'Test Native Push Notifications in Tray', completed: false },
];

export default function App() {
  const [inputText, setInputText] = useState('');
  const [todoList, setTodoList] = useState<Todo[]>(INITIAL_TODOS);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [notification, setNotification] = useState<string | null>(
    'Tasks loaded & connected'
  );

  // Request Android 13+ Notification Permission
  useEffect(() => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      ).catch(() => {});
    }
  }, []);

  const triggerPushAlert = (title: string, message: string) => {
    setNotification(message);

    if (PushNotificationModule && PushNotificationModule.triggerNotification) {
      PushNotificationModule.triggerNotification(title, message);
    }

    fetch(EVENT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        body: message,
        timestamp: new Date().toISOString(),
        userId: 1,
      }),
    }).catch(() => {});
  };

  const fetchTodos = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`${PUBLIC_API_URL}?_limit=4`, {
        headers: { 'Content-Type': 'application/json' },
        signal,
      });

      if (response.ok) {
        const json = await response.json();
        const mapped: Todo[] = json.map((item: any) => ({
          id: item.id.toString(),
          text: item.title || 'Untitled Task',
          completed: Boolean(item.completed),
        }));
        if (mapped.length > 0 && !signal?.aborted) {
          setTodoList(mapped);
          triggerPushAlert(
            'Tasks Synchronized',
            'Synced tasks with Public API'
          );
        }
      }
    } catch {
      // Keep initial tasks
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTodos(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchTodos]);

  const addTodo = async (customText?: string) => {
    const taskText = (customText || inputText).trim();
    if (!taskText) return;
    if (!customText) setInputText('');

    // Dismiss keyboard immediately so list is not obscured
    Keyboard.dismiss();

    const newId = `${Date.now()}`;
    const newTodo: Todo = { id: newId, text: taskText, completed: false };

    // Prepend new item to list so it appears at top
    setTodoList((prev) => [newTodo, ...prev]);

    triggerPushAlert('Task Created', `Added: "${taskText}"`);

    fetch(PUBLIC_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: taskText,
        completed: false,
        userId: 1,
      }),
    }).catch(() => {});
  };

  const toggleTodo = async (id: string | number) => {
    let updatedStatus = false;
    let taskName = '';

    setTodoList((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          updatedStatus = !todo.completed;
          taskName = todo.text;
          return { ...todo, completed: updatedStatus };
        }
        return todo;
      })
    );

    triggerPushAlert(
      'Task Status Changed',
      `Marked "${taskName}" as ${updatedStatus ? 'Completed' : 'Active'}`
    );

    fetch(`${PUBLIC_API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: updatedStatus }),
    }).catch(() => {});
  };

  const removeTodo = async (id: string | number, text: string) => {
    setTodoList((prev) => prev.filter((todo) => todo.id !== id));
    triggerPushAlert('Task Deleted', `Removed: "${text}"`);

    fetch(`${PUBLIC_API_URL}/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const fetchRandomSuggestion = async () => {
    setIsSuggesting(true);
    try {
      const randomId = Math.floor(Math.random() * 20) + 5;
      const response = await fetch(`${PUBLIC_API_URL}/${randomId}`);
      if (response.ok) {
        const data = await response.json();
        const suggestedText = data.title || 'Explore Cloud Testing';
        addTodo(suggestedText);
      } else {
        addTodo('Execute UIAutomator Cloud Test');
      }
    } catch {
      addTodo('Execute UIAutomator Cloud Test');
    } finally {
      setIsSuggesting(false);
    }
  };

  const filteredTodos = todoList.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header} testID="app_header">
          TestPilot Todo App
        </Text>

        {/* Event Notification Banner */}
        {notification && (
          <View style={styles.notificationBanner} testID="event_notification_banner">
            <Text style={styles.notificationText} testID="event_notification_text">
              🔔 {notification}
            </Text>
          </View>
        )}

        {/* Input Group */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter new task..."
            value={inputText}
            onChangeText={setInputText}
            testID="todo_input"
            accessibilityLabel="todo_input"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addTodo()}
            testID="add_todo_button"
            accessibilityLabel="Add Task"
            accessible={true}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Action Bar: Suggestion + Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.suggestBtn}
            onPress={fetchRandomSuggestion}
            disabled={isSuggesting}
            testID="suggest_task_button"
            accessibilityLabel="Suggest Public Task"
            accessible={true}
            accessibilityRole="button"
          >
            <Text style={styles.suggestBtnText}>
              {isSuggesting ? '⏳ Fetching...' : '💡 Suggest Public Task'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer} testID="filter_tabs">
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
            testID="filter_all_button"
            accessibilityLabel="filter_all"
            accessible={true}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All ({todoList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
            onPress={() => setFilter('active')}
            testID="filter_active_button"
            accessibilityLabel="filter_active"
            accessible={true}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'active' && styles.filterTabTextActive,
              ]}
            >
              Active ({todoList.filter((t) => !t.completed).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'completed' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('completed')}
            testID="filter_completed_button"
            accessibilityLabel="filter_completed"
            accessible={true}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'completed' && styles.filterTabTextActive,
              ]}
            >
              Completed ({todoList.filter((t) => t.completed).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Todo List */}
        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id.toString()}
          testID="todo_list"
          keyboardShouldPersistTaps="always"
          renderItem={({ item }) => (
            <View
              style={styles.todoItem}
              testID={`todo_item_${item.text}`}
              accessibilityLabel={`todo_item_${item.text}`}
            >
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleTodo(item.id)}
                testID={`toggle_${item.text}`}
                accessibilityLabel={`toggle_${item.text}`}
                accessible={true}
                accessibilityRole="button"
              >
                <Text style={styles.checkboxText}>
                  {item.completed ? '✅' : '⚪'}
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  styles.todoText,
                  item.completed && styles.todoTextCompleted,
                ]}
                testID={`todo_text_${item.text}`}
              >
                {item.text}
              </Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeTodo(item.id, item.text)}
                testID={`delete_${item.text}`}
                accessibilityLabel={`delete_${item.text}`}
                accessible={true}
                accessibilityRole="button"
              >
                <Text style={styles.deleteText}>❌</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer} testID="empty_state">
              <Text style={styles.emptyText}>No tasks found in this view.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingTop: 36,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 12,
  },
  notificationBanner: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notificationText: {
    fontSize: 12,
    color: '#3730A3',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 15,
    color: '#1F2937',
  },
  addButton: {
    width: 90,
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  suggestBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  suggestBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 4,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  checkbox: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  checkboxText: {
    fontSize: 20,
  },
  todoText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    marginRight: 6,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
});
