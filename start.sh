#!/bin/bash
echo "Starting GynoVision AI Suite with Docker..."
docker compose up -d --build

echo ""
echo "Waiting a few seconds for the services to initialise..."
sleep 5

echo "Opening frontend in your default browser..."
if which xdg-open > /dev/null
then
  xdg-open http://localhost
elif which gnome-open > /dev/null
then
  gnome-open http://localhost
elif which open > /dev/null
then
  open http://localhost
else
  echo -e "\nPlease open http://localhost in your browser manually."
fi

echo "Done!"
