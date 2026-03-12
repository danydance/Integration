def is_palindrome(word : str) -> bool:
    word = word.lower()
    for i in range(len(word)//2):
        if word[i] != word[-i-1]:
            return False
    return True


def main():
    print(is_palindrome("wow"))
    print(is_palindrome("what do you meannaem uoy od tahw"))
    print(is_palindrome("hello"))

if __name__ == '__main__':
    main()