# This project aims to provide a web dashboard to explore a list of emerging technologies in 2025. The project includes two sub-projects: 
# 1. technologies-exploration: This project lists potential technologies proposed by various LLM such as ChatGPT, Claudi.ai, Google Gemini, DeepSeek and allow the user to explore and navigate. 
# 2. technologies-assessment: This project shows the assessment of a fixed emerging technologies conducted by various LLMs. 
# Both projects can be started in a docker container or each can be started independently as a node.js.                    
# Docker Container: 
# Clean and rebuild the Docker image
docker build -t etief-dashboard .
# Run the container 
docker run -d -p 8080:8080 etief-dashboard

# To run each project independent 
# change to the related directory and run
 npm run dev