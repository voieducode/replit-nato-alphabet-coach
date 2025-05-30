import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConverterSection from '../converter-section'
import { LanguageProvider } from '../../contexts/LanguageContext'

const renderWithLanguage = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  )
}

describe('ConverterSection', () => {
  it('should render input field and convert button', () => {
    renderWithLanguage(<ConverterSection />)
    
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument()
    expect(screen.getByText(/nato alphabet/i)).toBeInTheDocument()
  })

  it('should convert text to NATO alphabet', async () => {
    const user = userEvent.setup()
    renderWithLanguage(<ConverterSection />)
    
    const input = screen.getByPlaceholderText(/enter text/i)
    await user.type(input, 'ABC')
    
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Bravo')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('should handle empty input', async () => {
    const user = userEvent.setup()
    renderWithLanguage(<ConverterSection />)
    
    const input = screen.getByPlaceholderText(/enter text/i)
    await user.clear(input)
    
    // Should not show any NATO words
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
  })

  it('should handle mixed case input', async () => {
    const user = userEvent.setup()
    renderWithLanguage(<ConverterSection />)
    
    const input = screen.getByPlaceholderText(/enter text/i)
    await user.type(input, 'aBc')
    
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Bravo')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('should handle numbers and special characters', async () => {
    const user = userEvent.setup()
    renderWithLanguage(<ConverterSection />)
    
    const input = screen.getByPlaceholderText(/enter text/i)
    await user.type(input, 'A1!')
    
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('!')).toBeInTheDocument()
  })

  it('should show pronunciation buttons for NATO words', async () => {
    const user = userEvent.setup()
    renderWithLanguage(<ConverterSection />)
    
    const input = screen.getByPlaceholderText(/enter text/i)
    await user.type(input, 'A')
    
    // Should show play button for pronunciation
    const playButton = screen.getByRole('button', { name: /play/i })
    expect(playButton).toBeInTheDocument()
  })

  it('should copy NATO alphabet to clipboard', async () => {
    const user = userEvent.setup()
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    })
    
    renderWithLanguage(<ConverterSection />)
    
    const input = screen.getByPlaceholderText(/enter text/i)
    await user.type(input, 'ABC')
    
    const copyButton = screen.getByRole('button', { name: /copy/i })
    await user.click(copyButton)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Alpha Bravo Charlie')
  })

  it('should show NATO alphabet reference', () => {
    renderWithLanguage(<ConverterSection />)
    
    expect(screen.getByText(/quick reference/i)).toBeInTheDocument()
    
    // Should show some NATO alphabet letters
    expect(screen.getByText(/A.*Alpha/)).toBeInTheDocument()
    expect(screen.getByText(/B.*Bravo/)).toBeInTheDocument()
  })

  it('should expand full alphabet reference', async () => {
    const user = userEvent.setup()
    renderWithLanguage(<ConverterSection />)
    
    const expandButton = screen.getByText(/view full alphabet/i)
    await user.click(expandButton)
    
    // Should show more letters after expanding
    expect(screen.getByText(/Z.*Zulu/)).toBeInTheDocument()
  })
})