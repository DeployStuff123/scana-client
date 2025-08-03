import React from 'react'
import useAuth from '../../hook/useAuth'
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { Box, CardActions, DialogActions, Typography } from '@mui/material'
import CButton from '../../common/CButton'
import apiReq from '../../../utils/axiosReq'
import toast from 'react-hot-toast'
import { deleteFile } from '../../../utils/fileHandler'

const DeleteFollowup = ({ id, img, closeDialog }) => {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => apiReq.delete(`api/follow-up/delete/${id}`, { headers: { Authorization: token } }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['follow-ups']);
      toast.success(res.data.message);
      closeDialog()
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    }
  });

  const handleDelete = async () => {
    deleteMutation.mutate()
    const fileId = img.split('/').pop().split('.')[0]
    const res = await deleteFile(fileId)
    console.log(res)
  }

  return (
      <DialogActions>
        <CButton onClick={() => closeDialog()}>Cancel</CButton>
        <CButton loading={deleteMutation.isPending} onClick={handleDelete} variant='contained' color='error'>Delete</CButton>
      </DialogActions>
  )
}

export default DeleteFollowup