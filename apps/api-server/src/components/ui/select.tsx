import * as React from "react"

export interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

export const Select: React.FC<SelectProps> = ({ children, value, onValueChange }) => {
  return <div>{children}</div>
}

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>
}

export const SelectItem: React.FC<{ children: React.ReactNode; value: string }> = ({ children }) => {
  return <div>{children}</div>
}

export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>
}

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  return <span>{placeholder}</span>
}