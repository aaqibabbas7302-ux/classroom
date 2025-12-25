'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { supabase, Subject, Message } from '@/lib/supabase'
import Image from 'next/image'

// Function to parse markdown-style formatting to HTML
function formatMessage(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="msg-heading">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="msg-heading">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="msg-heading">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Bullet points
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Line breaks
    .replace(/\n/g, '<br />')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>)(<br \/>)?/g, '$1')
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Form states
  const [subjectName, setSubjectName] = useState('')
  const [className, setClassName] = useState('')
  const [subjectType, setSubjectType] = useState('')
  const [board, setBoard] = useState('CBSE')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('👨‍🏫')
  const [editWebhookUrl, setEditWebhookUrl] = useState('')
  
  // Teacher emoji options
  const teacherEmojis = ['👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍💻', '👩‍💻', '🧑‍💻', '📚', '🎓', '✏️', '📖', '🔬', '🧮', '🌍', '💡', '🎨']
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Fetch subjects on load
  useEffect(() => {
    if (user) {
      fetchSubjects()
    }
  }, [user])

  // Fetch messages when subject changes
  useEffect(() => {
    if (currentSubject) {
      fetchMessages(currentSubject.id)
    }
  }, [currentSubject])

  const fetchSubjects = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subjects:', error)
      showToast('Failed to load subjects', 'error')
    } else {
      setSubjects(data || [])
    }
  }

  const fetchMessages = async (subjectId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data || [])
    }
  }

  const createSubject = async () => {
    if (!user) return
    
    if (!subjectName.trim()) {
      showToast('Please enter a name for this tutor', 'error')
      return
    }
    if (!className.trim()) {
      showToast('Please select a class', 'error')
      return
    }
    if (!subjectType.trim()) {
      showToast('Please select a subject', 'error')
      return
    }
    if (!webhookUrl.trim()) {
      showToast('Please enter a webhook URL', 'error')
      return
    }

    try {
      new URL(webhookUrl)
    } catch {
      showToast('Please enter a valid webhook URL', 'error')
      return
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: user.id,
        name: subjectName.trim(),
        class_name: className,
        subject_name: subjectType,
        board: board,
        webhook_url: webhookUrl.trim(),
        emoji: selectedEmoji
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subject:', error)
      showToast('Failed to create subject', 'error')
    } else {
      setSubjects([data, ...subjects])
      setCurrentSubject(data)
      setShowModal(false)
      setSubjectName('')
      setClassName('')
      setSubjectType('')
      setBoard('CBSE')
      setWebhookUrl('')
      setSelectedEmoji('👨‍🏫')
      showToast('Subject created successfully!', 'success')
    }
  }

  const updateWebhook = async () => {
    if (!currentSubject) return

    try {
      new URL(editWebhookUrl)
    } catch {
      showToast('Please enter a valid webhook URL', 'error')
      return
    }

    const { error } = await supabase
      .from('subjects')
      .update({ webhook_url: editWebhookUrl })
      .eq('id', currentSubject.id)

    if (error) {
      console.error('Error updating webhook:', error)
      showToast('Failed to update webhook', 'error')
    } else {
      setCurrentSubject({ ...currentSubject, webhook_url: editWebhookUrl })
      setSubjects(subjects.map(s => 
        s.id === currentSubject.id ? { ...s, webhook_url: editWebhookUrl } : s
      ))
      setShowWebhookModal(false)
      showToast('Webhook updated successfully!', 'success')
    }
  }

  const deleteSubject = async () => {
    if (!currentSubject) return

    if (!confirm('Are you sure you want to delete this subject? All chat history will be lost.')) {
      return
    }

    // Delete messages first
    await supabase
      .from('messages')
      .delete()
      .eq('subject_id', currentSubject.id)

    // Then delete subject
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', currentSubject.id)

    if (error) {
      console.error('Error deleting subject:', error)
      showToast('Failed to delete subject', 'error')
    } else {
      setSubjects(subjects.filter(s => s.id !== currentSubject.id))
      setCurrentSubject(null)
      setMessages([])
      showToast('Subject deleted successfully', 'success')
    }
  }

  const clearChat = async () => {
    if (!currentSubject) return

    if (!confirm('Are you sure you want to clear all messages?')) {
      return
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('subject_id', currentSubject.id)

    if (error) {
      console.error('Error clearing chat:', error)
      showToast('Failed to clear chat', 'error')
    } else {
      setMessages([])
      showToast('Chat cleared successfully', 'success')
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !currentSubject || !user) return

    const userMessage = messageInput.trim()
    setMessageInput('')
    setIsTyping(true)

    // Save user message to database
    const { data: savedUserMessage, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        subject_id: currentSubject.id,
        user_id: user.id,
        content: userMessage,
        type: 'sent'
      })
      .select()
      .single()

    if (userMsgError) {
      console.error('Error saving message:', userMsgError)
      setIsTyping(false)
      return
    }

    setMessages(prev => [...prev, savedUserMessage])

    try {
      // Send to webhook via our API route (avoids CORS issues)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          webhookUrl: currentSubject.webhook_url,
          subject: currentSubject.name,
          subjectName: currentSubject.subject_name,
          className: currentSubject.class_name,
          board: currentSubject.board,
          sessionId: currentSubject.id,
          userId: user.id
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Webhook request failed')
      }

      const aiResponse = data.response || 'No response received'

      // Save AI response to database
      const { data: savedAiMessage, error: aiMsgError } = await supabase
        .from('messages')
        .insert({
          subject_id: currentSubject.id,
          user_id: user.id,
          content: aiResponse,
          type: 'received'
        })
        .select()
        .single()

      if (!aiMsgError) {
        setMessages(prev => [...prev, savedAiMessage])
      }
    } catch (error) {
      console.error('Error sending to webhook:', error)
      
      // Save error message
      const { data: errorMessage } = await supabase
        .from('messages')
        .insert({
          subject_id: currentSubject.id,
          user_id: user.id,
          content: 'Sorry, I encountered an error. Please check your webhook URL and try again.',
          type: 'received'
        })
        .select()
        .single()

      if (errorMessage) {
        setMessages(prev => [...prev, errorMessage])
      }
      showToast('Failed to get response from AI Teacher', 'error')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isLoaded) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={() => setShowSidebar(!showSidebar)}>
          <i className="fas fa-bars"></i>
        </button>
        <div className="mobile-logo" onClick={() => setCurrentSubject(null)} style={{ cursor: 'pointer' }}>
          <Image src="/logo.png" alt="4Achievers Junior" width={150} height={40} style={{ objectFit: 'contain' }} />
        </div>
        <UserButton />
      </div>

      {/* Sidebar Overlay for Mobile */}
      {showSidebar && (
        <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => { setCurrentSubject(null); setShowSidebar(false); }} style={{ cursor: 'pointer' }}>
            <Image src="/logo.png" alt="4Achievers Junior" width={180} height={50} style={{ objectFit: 'contain' }} />
          </div>
          <button className="close-sidebar-btn" onClick={() => setShowSidebar(false)}>
            <i className="fas fa-times"></i>
          </button>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-9 h-9"
              }
            }}
          />
        </div>

        <button className="add-subject-btn" onClick={() => { setShowModal(true); setShowSidebar(false); }}>
          <i className="fas fa-book-open"></i>
          <span>New Subject</span>
        </button>

        <div className="subjects-list">
          {subjects.map(subject => (
            <div
              key={subject.id}
              className={`subject-item ${currentSubject?.id === subject.id ? 'active' : ''}`}
              onClick={() => { setCurrentSubject(subject); setShowSidebar(false); }}
            >
              <div className="subject-item-avatar">
                {subject.emoji || '👨‍🏫'}
              </div>
              <div className="subject-item-info">
                <div className="subject-item-name">{subject.name}</div>
                <div className="subject-item-preview">{subject.board} • Class {subject.class_name} • {subject.subject_name}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <p>🎓 Powered by AI</p>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="chat-area">
        {!currentSubject ? (
          <div className="welcome-screen">
            <div className="welcome-content">
              <i className="fas fa-chalkboard-teacher"></i>
              <h1>Welcome to AI Teacher</h1>
              <p>Create a subject and start learning with your personal AI Teacher</p>
              <button onClick={() => setShowModal(true)}>
                <i className="fas fa-book-open"></i>
                Create Your First Subject
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-container">
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="subject-avatar">
                  {currentSubject.emoji || '👨‍🏫'}
                </div>
                <div className="subject-details">
                  <h2>{currentSubject.name}</h2>
                  <span className="status">
                    <span className="status-dot"></span>
                    {currentSubject.board} • Class {currentSubject.class_name} • {currentSubject.subject_name}
                  </span>
                </div>
              </div>
              <div className="chat-header-actions">
                <button 
                  className="icon-btn" 
                  onClick={() => {
                    setEditWebhookUrl(currentSubject.webhook_url)
                    setShowWebhookModal(true)
                  }}
                  title="Configure Webhook"
                >
                  <i className="fas fa-cog"></i>
                </button>
                <button className="icon-btn" onClick={clearChat} title="Clear Chat">
                  <i className="fas fa-trash"></i>
                </button>
                <button className="icon-btn close-chat-btn" onClick={() => setCurrentSubject(null)} title="Close Chat">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-chat-icon">{currentSubject.emoji || '👨‍🏫'}</div>
                  <h3>Start Learning!</h3>
                  <p>Ask any question about {currentSubject.subject_name}</p>
                  <p className="hint">I&apos;m your {currentSubject.board} Class {currentSubject.class_name} teacher</p>
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className={`message ${message.type}`}>
                    {message.type === 'received' && (
                      <div className="message-avatar">{currentSubject.emoji || '👨‍🏫'}</div>
                    )}
                    <div className="message-bubble">
                      <div 
                        className="message-content"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                      <div className="message-time">{formatTime(message.created_at)}</div>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="message received">
                  <div className="message-avatar">{currentSubject.emoji || '👨‍🏫'}</div>
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  placeholder="Type your question here..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                />
                <button 
                  className="send-btn" 
                  onClick={sendMessage}
                  disabled={isTyping || !messageInput.trim()}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Subject Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📚 Create New Subject</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tutor Name</label>
                <input
                  type="text"
                  placeholder="e.g., My Science Tutor, Math Helper"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Board</label>
                  <select value={board} onChange={(e) => setBoard(e.target.value)}>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">IB</option>
                    <option value="IGCSE">IGCSE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Class</label>
                  <select value={className} onChange={(e) => setClassName(e.target.value)}>
                    <option value="">Select Class</option>
                    <option value="6">Class 6</option>
                    <option value="7">Class 7</option>
                    <option value="8">Class 8</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select value={subjectType} onChange={(e) => setSubjectType(e.target.value)}>
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Social Science">Social Science</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Economics">Economics</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Accountancy">Accountancy</option>
                  <option value="Business Studies">Business Studies</option>
                </select>
              </div>
              <div className="form-group">
                <label>n8n Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <small>Enter the webhook URL from your n8n AI agent workflow</small>
              </div>
              <div className="form-group">
                <label>Teacher Icon</label>
                <div className="emoji-picker">
                  {teacherEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className={`emoji-btn ${selectedEmoji === emoji ? 'selected' : ''}`}
                      onClick={() => setSelectedEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createSubject}>
                Create Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Settings Modal */}
      {showWebhookModal && (
        <div className="modal-overlay" onClick={() => setShowWebhookModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ Webhook Settings</h3>
              <button className="close-btn" onClick={() => setShowWebhookModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>n8n Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  value={editWebhookUrl}
                  onChange={(e) => setEditWebhookUrl(e.target.value)}
                />
                <small>Update the webhook URL for this subject's AI Teacher</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowWebhookModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={updateWebhook}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
