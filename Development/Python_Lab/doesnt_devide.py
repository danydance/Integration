
def not_devided(numbers_list : list[int]) -> list[int]:
    """
    this function returns a list that doesnt have the numbers that devide by the users input.
    """
    non_devide_number : int = int(input("choose a number : "))
    numbers_list = [x for x in numbers_list if x % non_devide_number == 0] # keeps all the numbers who can be devided
    return numbers_list
 
    
def main():
    print(not_devided([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]))

if __name__ == '__main__':
    main()