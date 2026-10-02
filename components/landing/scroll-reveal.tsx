'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  threshold?: number;
}

export function ScrollReveal({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
  threshold = 0.02,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip observer if prefers-reduced-motion is active
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const currentElement = domRef.current;
    if (!currentElement) return;

    // Use generous rootMargin so elements animate smoothly as they enter viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '50px 0px 50px 0px',
      }
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  const getDirectionTransform = () => {
    if (isVisible) return 'none';
    switch (direction) {
      case 'up':
        return 'translateY(20px)';
      case 'down':
        return 'translateY(-20px)';
      case 'left':
        return 'translateX(20px)';
      case 'right':
        return 'translateX(-20px)';
      case 'none':
        return 'none';
      default:
        return 'translateY(20px)';
    }
  };

  return (
    <div
      ref={domRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getDirectionTransform(),
        transition: `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
