import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Box } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom'
import apiReq from '../../../utils/axiosReq'
import CTextField from '../../common/CTextField'
import CButton from '../../common/CButton'

const PasswordReset = () => {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confermationMessage, setConfermationMessage] = useState('')

  const mutation = useMutation({
    mutationFn: (newPassword) => apiReq.post('/api/user/reset-password', { token, newPassword }),
    onSuccess: (res) => {
      toast.success(res.data.message)
      setConfermationMessage(res.data.message)
      setPassword('')
      setConfirmPassword('')
    },
    onError: (err) => {
      toast.error(err.response.data)
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await mutation.mutateAsync(password)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box sx={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 2
    }}>
      <Link style={{ textDecoration: 'none' }} to='/'>Back toHome</Link>
      <h2>Set New Password</h2>
      {
        confermationMessage ? (
          <p style={{ color: 'green' }}>{confermationMessage}</p>
        ) : (
          <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
            <CTextField
              sx={{ mb: 2, minWidth: '300px' }}
              size='small'
              topLabel='New Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <CTextField
              sx={{ mb: 2, minWidth: '300px' }}
              size='small'
              topLabel='Confirm New Password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <CButton type="submit" variant='contained' loading={mutation.isPending}>
              Save New Password
            </CButton>
          </form>
        )
      }
      {mutation.error && <p>Error: {mutation.error.response.data}</p>}
    </Box>
  )
}

export default PasswordReset