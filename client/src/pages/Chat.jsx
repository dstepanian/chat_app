import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
  Heading,
  Divider,
  Avatar,
} from '@chakra-ui/react'
import io from 'socket.io-client'

function Chat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [socket, setSocket] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState('')
  const navigate = useNavigate()
  const toast = useToast()
  const messagesEndRef = useRef(null)
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Connect to Socket.IO server
    const newSocket = io('http://localhost:5000')
    setSocket(newSocket)

    // Join the general room
    newSocket.emit('join_room', 'general')

    // Listen for messages
    newSocket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data])
    })

    // Listen for typing status
    newSocket.on('user_typing', (username) => {
      setIsTyping(true)
      setTypingUser(username)
      setTimeout(() => {
        setIsTyping(false)
        setTypingUser('')
      }, 1000)
    })

    return () => newSocket.close()
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (message.trim() && socket) {
      const messageData = {
        room: 'general',
        author: user.username,
        message: message.trim(),
      }

      socket.emit('send_message', messageData)
      setMessage('')
    }
  }

  const handleTyping = (e) => {
    setMessage(e.target.value)
    socket?.emit('typing', { room: 'general', author: user.username })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <Container maxW="container.md" h="100vh" py={4}>
      <VStack h="full" spacing={4}>
        <HStack w="full" justify="space-between">
          <Heading size="lg">Chat Room</Heading>
          <Button onClick={handleLogout} colorScheme="red" size="sm">
            Logout
          </Button>
        </HStack>
        <Divider />
        
        <Box
          flex={1}
          w="full"
          bg="gray.50"
          borderRadius="md"
          p={4}
          overflowY="auto"
        >
          <VStack align="stretch" spacing={4}>
            {messages.map((msg, index) => (
              <HStack
                key={index}
                alignSelf={msg.author === user.username ? 'flex-end' : 'flex-start'}
                bg={msg.author === user.username ? 'blue.100' : 'gray.100'}
                p={2}
                borderRadius="lg"
                maxW="70%"
              >
                {msg.author !== user.username && (
                  <Avatar size="sm" name={msg.author} />
                )}
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="gray.500">
                    {msg.author}
                  </Text>
                  <Text>{msg.message}</Text>
                </VStack>
              </HStack>
            ))}
            {isTyping && (
              <Text fontSize="xs" color="gray.500">
                {typingUser} is typing...
              </Text>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        <HStack as="form" w="full" onSubmit={handleSend}>
          <Input
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            size="lg"
          />
          <Button type="submit" colorScheme="blue" size="lg">
            Send
          </Button>
        </HStack>
      </VStack>
    </Container>
  )
}

export default Chat 