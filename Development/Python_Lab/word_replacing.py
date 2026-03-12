def replace():
    """
    this function replaces and old word to a new word in a sentence
    """
    sen = input("Enter a sentence: ")
    old = input("Enter the word to replace: ")
    new = input("Enter the new word: ")
    
    words = sen.split(" ")

    for i in range(len(words)): # for loop to replace all the old words with the new word
        if words[i] == old:
            words[i] = new

    return " ".join(words) # retuns the new sentence




def main():
    print(replace())

if __name__ == '__main__':
    main()