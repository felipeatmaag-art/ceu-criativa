// app.js - Ponto de entrada padrão para cPanel / Phusion Passenger da HostGator
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;

require('./dist/server.cjs');
