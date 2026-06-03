#!/bin/bash
# Git credential helper - read from env
read -r line
host***REMOVED***$(echo "$line" | grep -o 'host***REMOVED***[^ ]*' | cut -d***REMOVED*** -f2)
if [ "$host" ***REMOVED*** "github.com" ]; then
    GITHUB_TOKEN***REMOVED***$(cat ~/.auto-company/credentials/github.env 2>/dev/null | grep -v '^#' | grep -v '^$' | head -1)
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "username***REMOVED***tolgabrk"
        echo "password***REMOVED***$GITHUB_TOKEN"
    fi
fi
