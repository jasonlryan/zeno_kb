# Zeno KB Quick Start Guide

## 🚀 No More Directory Confusion!

These scripts automatically handle the `cd z_1` navigation for you.

## Available Scripts

### Development Server

```bash
./dev.sh
```

- Automatically navigates to `z_1` directory
- Starts the development server on `http://localhost:3000`
- **Use this instead of `pnpm dev`**

### Build Project

```bash
./build.sh
```

- Automatically navigates to `z_1` directory
- Builds the project for production
- **Use this instead of `pnpm build`**

### Install Dependencies

```bash
./install.sh
```

- Automatically navigates to `z_1` directory
- Installs all project dependencies
- **Use this instead of `pnpm install`**

## Quick Commands

| What you want to do | Old way                  | New way        |
| ------------------- | ------------------------ | -------------- |
| Start dev server    | `cd z_1 && pnpm dev`     | `./dev.sh`     |
| Build project       | `cd z_1 && pnpm build`   | `./build.sh`   |
| Install deps        | `cd z_1 && pnpm install` | `./install.sh` |

## 🎯 Just Remember

**Always run these from the `zeno_kb` root directory!**

The scripts will automatically:

- ✅ Check if you're in the right place
- ✅ Navigate to the `z_1` directory
- ✅ Run the correct command
- ❌ Show an error if something's wrong

## Navigation is Now Connected! 🎉

The left sidebar navigation is now fully functional:

- Click any item in the sidebar to navigate
- Search bar automatically switches to search view
- Active states show where you are
- All views are working (Home, Search, Library, Curator Dashboard, etc.)

## Troubleshooting

If you get permission errors, run:

```bash
chmod +x dev.sh build.sh install.sh
```
