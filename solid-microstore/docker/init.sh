#!/bin/bash
apt-get install jq -y
echo ">>> Writing environment variables to file <<<"
my_env=$(jq -n '$ENV | del(._, .SHLVL)')
echo $my_env
cat $my_env > /app/assets/config.json
