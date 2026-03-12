from random import randint
from time import sleep

def lottery() -> str:
    """
    this function is a lottery game : 
    you choose 3 numbers
    the computer choose 3 numbers
    if you have the same numbers you win
    """
    user_numbers = []
    lottery_numbers = []
    for i in range(3): # users input and computers lottery numbers
        user_numbers.append(int(input("choose a number between 0 - 9 : ")))  
        lottery_numbers.append(randint(1, 10))

    print("ok the computer number issss...") # for dramatic effect
    sleep(1)
    print("3")
    sleep(1)
    print("2")
    sleep(1)
    print("1")
    sleep(1)
    print(lottery_numbers)
    if sorted(user_numbers) == sorted(lottery_numbers): # checks if there is the right numbers.
        return "You win!!!!!"
    return "you lost"

def main():
    print(lottery())

if __name__ == '__main__':
    main()