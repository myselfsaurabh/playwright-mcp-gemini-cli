# String = "abcabcdhh"
# listVal = []
# result = []
# for i in String:
#     if i in listVal:
#         result = list(listVal)
#         print(f"this is result:{result} ")
#         listVal.clear()
#         listVal.append(i)
#     else:  
#         listVal.append(i)
#         print(f"this is listVal:{listVal}")
# print(f"this is finalval:{result} and length is {len(result)}")

# Find first non-repeating character in a string
# Input: "abcabcde"
# Output: 'd'

# String = "abcabcde"
# char = {}
# for i in String:
#     char[i] = char.get(i,0)+1
# for j in char:
#     if char[j] == 1:
#         print(j)
#         break

    
# Remove duplicates from a list while preserving order
# Input: [1][2][2][3][1][4]
# Output: [1][2][3][4]

# Input= [1,2,2,3,1,4]
# output = []
# for i in Input:
#     if i not in output:
#         output.append(i)
# print(output)

# Reverse a list in-place
# Input: [1][2][3][4]
# Output: [4][3][2][1]

# input = [1,2,3,4]
# for i in input[::-1]:
#     print(i)

# Check if a string is a palindrome
# Input: "racecar"
# Output: True

# string = "racecar"
# output = ""
# for i in string[::-1]:
#     output = output+i
# if output == string:
#     print("True")
# else:
#     print("False")


# Merge two sorted lists into one sorted list
# Input: [1][3][5], [2][4][6]
# Output: [1][2][3][4][5][6]

# list1 = [1,3,5]
# list2 = [2,4,6]

# for i in list2:
#     list1.append(i)
# print(list1)

# for i in list1:
#     for j in list1[0:]:
#         if list1[j] > list1[j+1]:
#             list1[j],list1[j+1] = list1[j+1],list1[j]
# print(list1)


# list1 = [1, 3, 5, 2, 4, 6]
# listLen = len(list1)
# temp = 0
# for i in range(listLen):
#     for j in range(listLen):
#         if list1[i]<list1[j]:
#             temp = list1[i]
#             list1[i] = list1[j]
#             list1[j] = temp
# print(list1)


# Find all pairs in a list that sum to a given target
# Input: [1][2][3][4][5], target = 5
# Output: [(1,4), (2,3)]

# input = [1,2,3,4,5]
# output = []
# subOutput = []
# lenInput = len(input)
# for i in range(lenInput):
#     for j in range(i,lenInput):
#         if input[i]+input[j]==5:
#             subOutput.append(input[i])
#             subOutput.append(input[j])
#             output.append(tuple(subOutput))
#             subOutput.clear()
# print(output)

# Check if a string is a palindrome (ignoring case and spaces).
# Example: Input "A man a plan a canal Panama", Output: True

# input  = "A man a plan a canal Panama"
# input = input.lower()
# input = input.replace(" ","")
# if input == input[::-1]:
#     print("True")
# else:
#     print("False")


# Count the frequency of each word in a sentence and store in a dictionary.
# Example: Input "cat dog cat dog dog", Output: {'cat': 2, 'dog': 3}

# input = ["cat", "dog", "cat", "dog", "dog"]
# dictInput = {}
# for item in input:
#     dictInput[item] = dictInput.get(item,0)+1

# print(dictInput)

# Invert a dictionary.
# Example: Input {'x': 1, 'y': 2, 'z': 3}, Output: {1: 'x', 2: 'y', 3: 'z'}

# Input = {'x': 1, 'y': 2, 'z': 3}
# output = {}

# for i in Input:
#     value = Input[i]
#     output[value] = i

# print(output)

# reversing a number num = 38492 output = 29483

input = 38492
output = 0

while input>1:
    output = output*10 + int(input)%10
    print(output)
    input = input/10
    int(input)
print(output)
