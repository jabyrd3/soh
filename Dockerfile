FROM node:latest
RUN apt-get update
RUN apt-get install -yf curl netcat-openbsd nginx vim htop
CMD ["bash"]
