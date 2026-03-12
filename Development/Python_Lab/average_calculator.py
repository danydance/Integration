def input_numbers() -> list[int]:
    """
    this function gets all the numbers by the users input and puts it in a list.
    """
    numbers : list[int] = []
    while True: # loop until presses q
        user_input = input("Enter a number (or 'q' to quit): ") # user input can be any value
        if user_input.lower() == 'q': # if presses q or Q it will exit the loop.
            break
        try: # try and except too see if the number is an integer
            number = int(user_input)
            numbers.append(number)
        except ValueError:
            print("Invalid input. Please enter a number or 'q' to quit.")
    
    if not numbers:
        return "No numbers were entered."
    return numbers


def calculate_avarage(number_list : list) -> int:
    """
    This functions calculates the avarage of numbers
    """
    try:
        if not number_list:
            return "No valid numbers provided."
        return sum(number_list) / len(number_list)
    except Exception as e:
        return f"Invalid. {e}"


def main():
    print(calculate_avarage(input_numbers()))

if __name__ == '__main__':
    main()