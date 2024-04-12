import React from 'react'
import { BiErrorCircle } from "react-icons/bi";

const ErrorComponent = () => {
  return (
    <div className='text-center d-flex flex row align-items-center justify-content-center'>
    <BiErrorCircle  className='fs-1 m-3 mb-4'/>
    <h2>Something went wrong please come later</h2>
  </div>
  )
}

export default ErrorComponent