/**
 * Shivansh Electronics contact points. These rotate through the branding bands
 * across the runtime - one or two visible at a time, never the whole list at
 * once. Rendered as clean typographic lockups, not as hyperlink-styled URLs.
 *
 * Short branded slugs are used in place of the raw long URLs from the brief's
 * mandatory contact block, because a full https://linktr.ee/... string is
 * unreadable at reel scale. The destinations are unchanged.
 */

export type Contact = {
	icon: string;
	label: string;
	value: string;
};

export const CONTACTS: Contact[] = [
	{icon: '🌐', label: 'Website', value: 'shivanshelectronics.in'},
	{icon: '💬', label: 'WhatsApp', value: '+91 98316 62458'},
	{icon: '🔗', label: 'Linktree Hub', value: 'shivanshelectronics.in/linktree-hub'},
	{icon: '💬', label: 'WhatsApp', value: '+91 91477 00677'},
	{icon: '📢', label: 'WhatsApp Channel', value: 'shivanshelectronics.in/whatsapp-channel'},
	{icon: '💬', label: 'WhatsApp', value: '+91 89818 07755'},
	{icon: '🔹', label: 'YouTube', value: 'shivanshelectronics.in/youtube-channel'},
	{icon: '🔹', label: 'Instagram', value: 'shivanshelectronics.in/instagram-page'},
	{icon: '🔹', label: 'Facebook', value: 'shivanshelectronics.in/facebook-page'},
	{icon: '🔹', label: 'LinkedIn', value: 'shivanshelectronics.in/linkedin-page'},
	{icon: '🔹', label: 'Threads', value: 'shivanshelectronics.in/threads-profile'},
	{icon: '🔹', label: 'X (Twitter)', value: 'shivanshelectronics.in/x-twitter-profile'},
	{icon: '📌', label: 'Directions', value: 'shivanshelectronics.in/google-profile-location'},
];

export const ADDRESS = {
	line1: 'Raja Electric — Shivansh Electronics',
	line2: '3 Ramanath Das Road, Dhakuria, Tanu Pukur, Garfa',
	line3: 'Kolkata, West Bengal 700031',
};
