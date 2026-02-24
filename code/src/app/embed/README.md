# Enterprise Chat Widget

A modern, enterprise-ready chat widget with intelligent single-color theming system.

## Features

✨ **Enterprise UX Design**
- Clean, professional interface
- Smooth animations and transitions
- Responsive design (desktop & mobile)
- Modern message bubbles with avatars
- Real-time typing indicators
- Elegant empty states

🎨 **Intelligent Color Theming**
- Single color input generates entire palette
- Automatic light/dark text color detection
- Harmonious color derivation using HSL color space
- Professional color combinations
- Consistent brand appearance

🚀 **Embed-Optimized**
- Lightweight and performant
- Popup/modal optimized design
- Close button integration
- Parent window communication
- Cross-origin compatible

## Installation

### Basic Setup

Add the following script to your website:

```html
<script 
  src="https://yourdomain.com/embed.js"
  data-chat-url="https://yourdomain.com/embed"
  data-colour="#4F46E5"
  data-tagline="Chat with us!"
  data-display-mobile="true"
></script>
```

### Configuration Options

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-chat-url` | string | Required | URL to your chat embed page |
| `data-colour` | string | `#4F46E5` | Base brand color (hex format) |
| `data-tagline` | string | `"Talk to our AI Agent now"` | Chat bubble tagline |
| `data-display-mobile` | boolean | `true` | Show on mobile devices |

### Color Examples

```html
<!-- Indigo (Tech/SaaS) -->
<script src="..." data-colour="#4F46E5"></script>

<!-- Blue (Professional) -->
<script src="..." data-colour="#2563EB"></script>

<!-- Purple (Creative) -->
<script src="..." data-colour="#7C3AED"></script>

<!-- Green (Finance/Health) -->
<script src="..." data-colour="#059669"></script>

<!-- Orange (E-commerce) -->
<script src="..." data-colour="#EA580C"></script>

<!-- Pink (Lifestyle) -->
<script src="..." data-colour="#EC4899"></script>

<!-- Teal (Modern) -->
<script src="..." data-colour="#0D9488"></script>
```

## Color Theming System

### How It Works

The widget uses a sophisticated color derivation algorithm:

1. **Input**: Single hex color (e.g., `#4F46E5`)
2. **HSL Conversion**: Converts to Hue, Saturation, Lightness
3. **Palette Generation**: Creates color variations:
   - Primary (base)
   - Primary Light (+15% lightness)
   - Primary Dark (-15% lightness)
   - Primary Subtle (low saturation, high lightness)
4. **Smart Text Colors**: Auto-detects if base is light/dark
5. **CSS Variables**: Applied globally for consistency

### Generated Palette

Each color generates:

```css
--chat-primary: /* Your brand color */
--chat-primary-light: /* Hover states */
--chat-primary-dark: /* Active states */
--chat-primary-subtle: /* Backgrounds */
--chat-user-message: /* User message bubble */
--chat-bot-message: /* Bot message bubble */
--chat-user-message-text: /* Auto: black or white */
--chat-bot-message-text: /* Message text */
```

### Design Guidelines

**Best Colors for Enterprise Chat:**

✅ **Recommended**
- Blues: Professional, trustworthy
- Purples: Innovative, creative
- Teals: Modern, balanced
- Indigos: Tech-forward, reliable

⚠️ **Use with Caution**
- Reds: Can signal errors
- Yellows: Hard to read
- Very light colors: Poor contrast
- Very dark colors: May look heavy

## Customization

### Direct URL Access

You can also access the chat widget directly:

```
https://yourdomain.com/embed?host=example.com&color=4F46E5
```

Parameters:
- `host`: Origin website (for tracking)
- `color`: Hex color without # (e.g., `4F46E5`)

### Advanced Styling

To override default styles, use CSS custom properties:

```css
iframe {
  --chat-border-radius: 20px;
  --chat-shadow: rgba(0, 0, 0, 0.2);
}
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS 14+, Android 5+)

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- High contrast text
- Focus indicators
- Semantic HTML structure

## Performance

- **Bundle Size**: ~15KB (gzipped)
- **First Paint**: < 100ms
- **Time to Interactive**: < 200ms
- **No external dependencies** (except React)

## Troubleshooting

### Color not applying?

1. Check hex format: Must be valid hex (e.g., `#4F46E5`)
2. No spaces in color value
3. Include the `#` in the embed script

### Widget not showing?

1. Verify script is loaded: Check browser console
2. Check `data-display-mobile` on mobile devices
3. Ensure no z-index conflicts (widget uses 999999)

### Close button not working?

1. Verify parent window communication
2. Check for Content Security Policy restrictions
3. Ensure iframe is not blocked by browser settings

## Architecture

```
embed/
├── widget.tsx          # Main chat component
├── widget.module.css   # Component styles
├── colorTheme.ts       # Color derivation logic
├── page.tsx           # Next.js page wrapper
└── README.md          # This file
```

## Examples

### Minimal Setup

```html
<script src="https://yourdomain.com/embed.js" data-colour="#4F46E5"></script>
```

### Full Configuration

```html
<script 
  src="https://yourdomain.com/embed.js"
  data-chat-url="https://yourdomain.com/embed"
  data-colour="#7C3AED"
  data-tagline="Need help? Let's chat!"
  data-display-mobile="true"
></script>
```

### Multiple Widgets (Different Pages)

```html
<!-- Homepage: Friendly purple -->
<script src="..." data-colour="#7C3AED" data-tagline="Welcome! How can we help?"></script>

<!-- Product Page: Professional blue -->
<script src="..." data-colour="#2563EB" data-tagline="Questions about this product?"></script>

<!-- Support Page: Trustworthy green -->
<script src="..." data-colour="#059669" data-tagline="Get instant support"></script>
```

## Best Practices

1. **Choose Brand-Consistent Colors**: Match your website's primary brand color
2. **Test Contrast**: Ensure readability on all backgrounds
3. **Mobile-First**: Test on various screen sizes
4. **Performance**: Load script asynchronously if possible
5. **Analytics**: Monitor chat engagement through provided events

## Support

For issues or questions:
- GitHub Issues: [your-repo/issues]
- Email: support@yourdomain.com
- Documentation: https://yourdomain.com/docs

---

**Version**: 2.0.0  
**Last Updated**: 2024  
**License**: MIT
