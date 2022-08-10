import  TelegramBot from 'node-telegram-bot-api';
const token = '5554918701:AAF0soyElPIDg6FRnEVjbXAc9awE21cHuXw';
const bot = new TelegramBot(token, {polling: false});
bot.sendMessage('-669513119', 'Received your messagssse');