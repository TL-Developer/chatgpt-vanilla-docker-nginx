docker build -t liminha/chatgpt-vanilla .

docker run --name liminha/chatgpt-vanilla -d -p 80:80 liminha/chatgpt-vanilla