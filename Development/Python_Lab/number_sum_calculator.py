def sum_number(number_list : list[int]) -> list[int]:
    """
    this function retuns a new list with the sum of the 
    amount of numbers that we see
    """
    result : list[int] = [0]*10 # new list
    for number in number_list: 
        result[number - 1] += 1
    
    return result # returns a new list

def main():
    print(sum_number([1,1,1,1,1,2,1,2,3,4,2,3,6,7,5,5,5,6,5,8]))

if __name__ == '__main__':
    main()