/**
 * Custom hook for localized HTML5 form validation messages
 */

import { useEffect, RefObject } from 'react';
import { useTranslations } from 'next-intl';

export function useFormValidation(formRef: RefObject<HTMLFormElement>) {
  const t = useTranslations('validation');

  useEffect(() => {
    if (!formRef.current) return;

    const form = formRef.current;
    const inputs = form.querySelectorAll('input, select, textarea');

    const handleInvalid = (e: Event) => {
      e.preventDefault();
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

      // Clear previous custom message
      target.setCustomValidity('');

      // Check which validation failed and set appropriate message
      if (target.validity.valueMissing) {
        target.setCustomValidity(t('required'));
      } else if (target.validity.typeMismatch) {
        if (target.type === 'email') {
          target.setCustomValidity(t('invalidEmail'));
        } else if (target.type === 'tel') {
          target.setCustomValidity(t('invalidPhone'));
        }
      } else if (target.validity.tooShort) {
        const minLength = target.getAttribute('minlength');
        target.setCustomValidity(t('minLength', { min: minLength }));
      } else if (target.validity.tooLong) {
        const maxLength = target.getAttribute('maxlength');
        target.setCustomValidity(t('maxLength', { max: maxLength }));
      } else if (target.validity.rangeUnderflow) {
        const min = target.getAttribute('min');
        target.setCustomValidity(t('minValue', { min }));
      } else if (target.validity.rangeOverflow) {
        const max = target.getAttribute('max');
        target.setCustomValidity(t('maxValue', { max }));
      } else if (target.validity.patternMismatch) {
        target.setCustomValidity(t('invalidFormat'));
      }

      // Show the validation message
      target.reportValidity();
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      // Clear custom validity when user starts typing
      target.setCustomValidity('');
    };

    inputs.forEach((input) => {
      input.addEventListener('invalid', handleInvalid);
      input.addEventListener('input', handleInput);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('invalid', handleInvalid);
        input.removeEventListener('input', handleInput);
      });
    };
  }, [t]);
}
