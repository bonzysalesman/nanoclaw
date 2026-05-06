import { describe, expect, it } from 'vitest';

import { detectWhatsAppMention } from './whatsapp.js';

describe('detectWhatsAppMention', () => {
  it('matches the configured trigger at the start of a message', () => {
    expect(detectWhatsAppMention('@Andy summarize this chat')).toBe(true);
  });

  it('ignores leading whitespace before the trigger', () => {
    expect(detectWhatsAppMention('   @Andy summarize this chat')).toBe(true);
  });

  it('does not treat mid-message text as a trigger', () => {
    expect(detectWhatsAppMention('please ask @Andy later')).toBe(false);
  });

  it('does not trigger on assistant-prefixed outbound text', () => {
    expect(detectWhatsAppMention('Andy: working on it')).toBe(false);
  });
});
