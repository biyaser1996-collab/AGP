#!/bin/bash
echo "Stopping GHL Marketplace App..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
echo "Stopped."
