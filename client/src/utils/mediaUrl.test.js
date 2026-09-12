import { describe, expect, it } from 'vitest';
import { isAbsoluteUrl, resolveMediaUrl } from './mediaUrl';

describe('mediaUrl utility', () => {
  it('identifies absolute URLs correctly including http, https, data, and blob', () => {
    expect(isAbsoluteUrl('https://example.com/avatar.png')).toBe(true);
    expect(isAbsoluteUrl('http://example.com/avatar.png')).toBe(true);
    expect(isAbsoluteUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(true);
    expect(isAbsoluteUrl('blob:http://localhost:5173/uuid-123')).toBe(true);

    expect(isAbsoluteUrl('/avatars/user_1.png')).toBe(false);
    expect(isAbsoluteUrl('avatars/user_1.png')).toBe(false);
    expect(isAbsoluteUrl('')).toBe(false);
    expect(isAbsoluteUrl(null)).toBe(false);
  });

  it('resolves default avatar url correctly', () => {
    expect(resolveMediaUrl('/avatars/default.png')).toBe('/images/default_avatar.svg');
    expect(resolveMediaUrl('http://example.com/avatars/default.png')).toBe('/images/default_avatar.svg');
  });

  it('keeps absolute, data, and blob URLs untouched', () => {
    expect(resolveMediaUrl('https://res.cloudinary.com/demo/image.png')).toBe('https://res.cloudinary.com/demo/image.png');
    expect(resolveMediaUrl('data:image/jpeg;base64,abc')).toBe('data:image/jpeg;base64,abc');
    expect(resolveMediaUrl('blob:http://localhost:5173/test')).toBe('blob:http://localhost:5173/test');
  });

  it('prepends baseUrl to relative urls correctly without double slash', () => {
    expect(resolveMediaUrl('/avatars/avatar_123.png', 'https://api.example.com')).toBe('https://api.example.com/avatars/avatar_123.png');
    expect(resolveMediaUrl('avatars/avatar_123.png', 'https://api.example.com')).toBe('https://api.example.com/avatars/avatar_123.png');
  });

  it('returns empty string for falsy input', () => {
    expect(resolveMediaUrl('')).toBe('');
    expect(resolveMediaUrl(null)).toBe('');
    expect(resolveMediaUrl(undefined)).toBe('');
  });
});
