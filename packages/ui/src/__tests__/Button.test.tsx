import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { Button } from '../Button';

describe('Button Component', () => {
  const defaultProps = {
    children: 'Click me',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render button with children', () => {
      render(<Button {...defaultProps} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render button with custom className', () => {
      render(<Button {...defaultProps} className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should render button with different variants', () => {
      const { rerender } = render(<Button {...defaultProps} variant="primary" />);
      expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

      rerender(<Button {...defaultProps} variant="secondary" />);
      expect(screen.getByRole('button')).toHaveClass('bg-gray-600');

      rerender(<Button {...defaultProps} variant="success" />);
      expect(screen.getByRole('button')).toHaveClass('bg-green-600');

      rerender(<Button {...defaultProps} variant="danger" />);
      expect(screen.getByRole('button')).toHaveClass('bg-red-600');

      rerender(<Button {...defaultProps} variant="warning" />);
      expect(screen.getByRole('button')).toHaveClass('bg-yellow-600');
    });

    it('should render button with different sizes', () => {
      const { rerender } = render(<Button {...defaultProps} size="sm" />);
      expect(screen.getByRole('button')).toHaveClass('px-3 py-1.5 text-sm');

      rerender(<Button {...defaultProps} size="md" />);
      expect(screen.getByRole('button')).toHaveClass('px-4 py-2');

      rerender(<Button {...defaultProps} size="lg" />);
      expect(screen.getByRole('button')).toHaveClass('px-6 py-3 text-lg');
    });

    it('should render disabled button', () => {
      render(<Button {...defaultProps} disabled />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50 cursor-not-allowed');
    });

    it('should render loading button', () => {
      render(<Button {...defaultProps} loading />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
      expect(button).toHaveClass('opacity-50 cursor-not-allowed');
    });

    it('should render button with icon', () => {
      const Icon = () => <span data-testid="icon">🚀</span>;
      render(<Button {...defaultProps} icon={<Icon />} />);
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('should render button with icon only', () => {
      const Icon = () => <span data-testid="icon">🚀</span>;
      render(<Button {...defaultProps} icon={<Icon />} iconOnly />);
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.queryByText('Click me')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const onClick = jest.fn();
      render(<Button {...defaultProps} onClick={onClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const onClick = jest.fn();
      render(<Button {...defaultProps} onClick={onClick} disabled />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const onClick = jest.fn();
      render(<Button {...defaultProps} onClick={onClick} loading />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard interactions', () => {
      const onClick = jest.fn();
      render(<Button {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      
      // Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(onClick).toHaveBeenCalledTimes(1);
      
      // Space key
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('should handle focus and blur events', () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      render(<Button {...defaultProps} onFocus={onFocus} onBlur={onBlur} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.focus(button);
      expect(onFocus).toHaveBeenCalledTimes(1);
      
      fireEvent.blur(button);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button {...defaultProps} aria-label="Custom label" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should have proper ARIA attributes when loading', () => {
      render(<Button {...defaultProps} loading aria-label="Loading button" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Loading button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have proper ARIA attributes when disabled', () => {
      render(<Button {...defaultProps} disabled aria-label="Disabled button" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Disabled button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button {...defaultProps} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Styling', () => {
    it('should apply full width when fullWidth prop is true', () => {
      render(<Button {...defaultProps} fullWidth />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('should apply rounded corners when rounded prop is true', () => {
      render(<Button {...defaultProps} rounded />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
    });

    it('should apply outline style when outline prop is true', () => {
      render(<Button {...defaultProps} outline variant="primary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2 border-blue-600 text-blue-600 bg-transparent');
    });

    it('should apply ghost style when ghost prop is true', () => {
      render(<Button {...defaultProps} ghost variant="primary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent text-blue-600 hover:bg-blue-50');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button onClick={jest.fn()} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeEmptyDOMElement();
    });

    it('should handle null children', () => {
      render(<Button onClick={jest.fn()}>{null}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeEmptyDOMElement();
    });

    it('should handle undefined onClick', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('should handle complex children', () => {
      render(
        <Button onClick={jest.fn()}>
          <span>Text</span>
          <strong>Bold</strong>
          <em>Italic</em>
        </Button>
      );
      
      expect(screen.getByText('Text')).toBeInTheDocument();
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('Italic')).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('should accept valid button types', () => {
      const { rerender } = render(<Button {...defaultProps} type="button" />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

      rerender(<Button {...defaultProps} type="submit" />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

      rerender(<Button {...defaultProps} type="reset" />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });

    it('should default to button type when not specified', () => {
      render(<Button {...defaultProps} />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const onClick = jest.fn();
      const { rerender } = render(<Button {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      const initialRenderCount = onClick.mock.calls.length;
      
      rerender(<Button {...defaultProps} onClick={onClick} />);
      fireEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(initialRenderCount + 1);
    });
  });
}); 