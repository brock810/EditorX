curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y python3
sudo apt-get install -y default-jdk
sudo apt-get install -y golang
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y dotnet-sdk-6.0

sudo apt-get install -y ruby-full
sudo snap install --classic kotlin

echo "All dependencies installed successfully."